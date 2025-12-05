import React, { useRef, useState } from 'react';
import { uploadBlob } from '../utils/upload';

const SignaturePreview = ({ data }) => {
    const signatureRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedHeadshotUrl, setUploadedHeadshotUrl] = useState(null);

    const getLogoSrc = () => {
        if (data.logo === 'show') return 'https://res.cloudinary.com/dippj70ao/image/upload/v1763925891/skyhi-og-image-black_iychjj.png';
        return null;
    };

    const logoSrc = getLogoSrc();

    const hiddenCopyRef = useRef(null);

    // Check if URL is a local data URL (not yet uploaded to Cloudinary)
    const isLocalDataUrl = (url) => {
        return url && url.startsWith('data:');
    };

    // Crop the local image using canvas based on current scale/position settings
    // This must match exactly how the CSS preview renders the image
    const cropImageToBlob = async (dataUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const size = data.headshotContainerSize;
                
                canvas.width = size;
                canvas.height = size;
                
                // CSS preview sets: width: ${headshotImageScale}% of container
                // So scaled width = container size * (scale / 100)
                const scaledWidth = size * (data.headshotImageScale / 100);
                
                // Maintain aspect ratio (height: auto in CSS)
                const aspectRatio = img.height / img.width;
                const scaledHeight = scaledWidth * aspectRatio;
                
                // CSS preview offset: left/top = (headshotX/Y - 50) * 5 px
                const xOffset = (data.headshotX - 50) * 5;
                const yOffset = (data.headshotY - 50) * 5;
                
                // Position: start at top-left (0,0) and apply offset
                // The CSS uses position: relative with left/top offsets
                const x = xOffset;
                const y = yOffset;
                
                // Draw the image
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                }, 'image/jpeg', 0.9);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    };

    const copyToClipboard = async () => {
        if (!hiddenCopyRef.current) return;

        try {
            let headshotUrlForEmail = data.headshotUrl;
            
            // If headshot is a local data URL, crop and upload it first
            if (data.showHeadshot && data.headshotUrl && isLocalDataUrl(data.headshotUrl)) {
                setIsUploading(true);
                
                try {
                    // Crop the image using canvas
                    const croppedBlob = await cropImageToBlob(data.headshotUrl);
                    
                    // Upload to Cloudinary
                    headshotUrlForEmail = await uploadBlob(croppedBlob, 'headshot.jpg');
                    setUploadedHeadshotUrl(headshotUrlForEmail);
                    console.log('Uploaded cropped headshot to:', headshotUrlForEmail);
                } catch (uploadError) {
                    console.error('Failed to upload headshot:', uploadError);
                    alert('Failed to upload headshot image. The signature will be copied without the headshot image working for recipients.');
                }
                
                setIsUploading(false);
            } else if (uploadedHeadshotUrl) {
                // Use previously uploaded URL if available
                headshotUrlForEmail = uploadedHeadshotUrl;
            }

            // Build the signature HTML with the uploaded URL
            // We need to re-render the hidden copy with the correct URL
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = hiddenCopyRef.current.innerHTML;
            
            // Replace the data URL with the Cloudinary URL in the HTML
            if (headshotUrlForEmail && !isLocalDataUrl(headshotUrlForEmail)) {
                const imgElements = tempContainer.querySelectorAll('img');
                imgElements.forEach(img => {
                    if (img.alt === data.fullName && isLocalDataUrl(img.src)) {
                        img.src = headshotUrlForEmail;
                    }
                });
            }

            const html = tempContainer.innerHTML;

            // Use the Clipboard API to write HTML
            const blob = new Blob([html], { type: 'text/html' });
            const textBlob = new Blob([tempContainer.innerText], { type: 'text/plain' });

            const item = new ClipboardItem({
                'text/html': blob,
                'text/plain': textBlob
            });

            await navigator.clipboard.write([item]);
            alert('Signature copied to clipboard! Paste it into Gmail settings.');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy. Please try selecting and copying manually.');
            setIsUploading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Preview</h2>
                <button 
                    className="btn btn-primary" 
                    onClick={copyToClipboard}
                    disabled={isUploading}
                >
                    {isUploading ? 'Uploading image...' : 'Copy Signature'}
                </button>
            </div>

            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '4px',
                overflowX: 'auto'
            }}>
                {/* Visible Preview - Tighter spacing for browser */}
                <div ref={signatureRef} style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.4' }}>
                    <SignatureContent data={data} logoSrc={logoSrc} isForCopy={false} />
                </div>

                {/* Hidden Copy Source - Looser spacing for email clients */}
                <div ref={hiddenCopyRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.4' }}>
                        <SignatureContent data={data} logoSrc={logoSrc} isForCopy={true} />
                    </div>
                </div>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Note: Headshots are cropped and uploaded when you copy the signature.
                The image in your signature will be hosted on Cloudinary for email compatibility.
            </p>
        </div>
    );
};

const SignatureContent = ({ data, logoSrc, isForCopy }) => {
    // Spacing values based on context
    const titlePaddingBottom = isForCopy ? '18px' : '10px';
    const nameMarginBottom = isForCopy ? '2px' : '0px';
    const rowPaddingBottom = isForCopy ? '5px' : '2px';

    const getShapeStyles = (shape) => {
        switch (shape) {
            case 'circle':
                return { borderRadius: '50%' };
            case 'rounded':
                return { borderRadius: '15px' };
            case 'squircle':
                return { borderRadius: '25%' };
            case 'leaf':
                return { borderRadius: '0px 50% 50% 50%' };
            case 'leaf-inverse':
                return { borderRadius: '50% 0px 50% 50%' };
            case 'left-rounded':
                return { borderRadius: '50% 0 0 50%' };
            case 'top-left-round':
                return { borderRadius: '50% 0 0 0' };
            case 'bottom-left-round':
                return { borderRadius: '0 0 0 50%' };
            case 'left-squircle':
                return { borderRadius: '25% 0 0 25%' };
            case 'diamond-square':
                return {
                    clipPath: 'polygon(0% 50%, 25% 0%, 100% 0%, 100% 100%, 25% 100%)',
                    WebkitClipPath: 'polygon(0% 50%, 25% 0%, 100% 0%, 100% 100%, 25% 100%)',
                    borderRadius: '0'
                };
            case 'diamond-rounded':
                return {
                    clipPath: 'polygon(0% 50%, 25% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 25% 100%)',
                    WebkitClipPath: 'polygon(0% 50%, 25% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 25% 100%)',
                    borderRadius: '0'
                };
            case 'diamond-squircle':
                return {
                    clipPath: 'polygon(0% 50%, 25% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 25% 100%)',
                    WebkitClipPath: 'polygon(0% 50%, 25% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 25% 100%)',
                    borderRadius: '0'
                };
            case 'octagon-square':
                return {
                    clipPath: 'polygon(0% 30%, 0% 70%, 15% 85%, 15% 100%, 100% 100%, 100% 0%, 15% 0%, 15% 15%)',
                    WebkitClipPath: 'polygon(0% 30%, 0% 70%, 15% 85%, 15% 100%, 100% 100%, 100% 0%, 15% 0%, 15% 15%)',
                    borderRadius: '0'
                };
            case 'octagon-rounded':
                return {
                    clipPath: 'polygon(0% 30%, 0% 70%, 15% 85%, 15% 100%, 90% 100%, 100% 90%, 100% 10%, 90% 0%, 15% 0%, 15% 15%)',
                    WebkitClipPath: 'polygon(0% 30%, 0% 70%, 15% 85%, 15% 100%, 90% 100%, 100% 90%, 100% 10%, 90% 0%, 15% 0%, 15% 15%)',
                    borderRadius: '0'
                };
            case 'octagon-squircle':
                return {
                    clipPath: 'polygon(0% 30%, 0% 70%, 15% 85%, 15% 100%, 85% 100%, 100% 85%, 100% 15%, 85% 0%, 15% 0%, 15% 15%)',
                    WebkitClipPath: 'polygon(0% 30%, 0% 70%, 15% 85%, 15% 100%, 85% 100%, 100% 85%, 100% 15%, 85% 0%, 15% 0%, 15% 15%)',
                    borderRadius: '0'
                };
            case 'hexagon-square':
                return {
                    clipPath: 'polygon(0% 25%, 0% 75%, 25% 100%, 100% 100%, 100% 0%, 25% 0%)',
                    WebkitClipPath: 'polygon(0% 25%, 0% 75%, 25% 100%, 100% 100%, 100% 0%, 25% 0%)',
                    borderRadius: '0'
                };
            case 'hexagon-rounded':
                return {
                    clipPath: 'polygon(0% 25%, 0% 75%, 25% 100%, 90% 100%, 100% 90%, 100% 10%, 90% 0%, 25% 0%)',
                    WebkitClipPath: 'polygon(0% 25%, 0% 75%, 25% 100%, 90% 100%, 100% 90%, 100% 10%, 90% 0%, 25% 0%)',
                    borderRadius: '0'
                };
            case 'hexagon-squircle':
                return {
                    clipPath: 'polygon(0% 25%, 0% 75%, 25% 100%, 85% 100%, 100% 85%, 100% 15%, 85% 0%, 25% 0%)',
                    WebkitClipPath: 'polygon(0% 25%, 0% 75%, 25% 100%, 85% 100%, 100% 85%, 100% 15%, 85% 0%, 25% 0%)',
                    borderRadius: '0'
                };
            case 'hexagon':
                return {
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    WebkitClipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    borderRadius: '0'
                };
            case 'pentagon':
                return {
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                    WebkitClipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                    borderRadius: '0'
                };
            case 'octagon':
                return {
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                    WebkitClipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                    borderRadius: '0'
                };
            case 'message':
                return {
                    borderRadius: '50% 50% 50% 0px'
                };
            case 'message-inverse':
                return {
                    borderRadius: '50% 50% 0px 50%'
                };
            case 'diamond':
                return {
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    WebkitClipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    borderRadius: '0'
                };
            default: // square
                return { borderRadius: '0' };
        }
    };

    // Fixed height container matching headshot size
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'stretch',
            height: `${data.headshotContainerSize}px`,
            fontFamily: 'Arial, sans-serif' 
        }}>
            {/* Headshot */}
            {data.showHeadshot && data.headshotUrl && (
                <div style={{ paddingRight: '10px', display: 'flex', alignItems: 'center' }}>
                    {isForCopy ? (
                        // For email copy: use direct URL (will be replaced with Cloudinary URL on copy)
                        // The image is already cropped client-side before upload
                        <img
                            src={data.headshotUrl}
                            alt={data.fullName}
                            width={data.headshotContainerSize}
                            height={data.headshotContainerSize}
                            style={{
                                width: `${data.headshotContainerSize}px`,
                                height: `${data.headshotContainerSize}px`,
                                display: 'block',
                                border: '0',
                                ...getShapeStyles(data.headshotShape)
                            }}
                        />
                    ) : (
                        <div style={{
                            width: `${data.headshotContainerSize}px`,
                            height: `${data.headshotContainerSize}px`,
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                            ...getShapeStyles(data.headshotShape)
                        }}>
                            <img
                                src={data.headshotUrl}
                                alt={data.fullName}
                                style={{
                                    width: `${data.headshotImageScale}%`,
                                    height: 'auto',
                                    maxWidth: 'none',
                                    position: 'relative',
                                    left: `${(data.headshotX - 50) * 5}px`,
                                    top: `${(data.headshotY - 50) * 5}px`,
                                    display: 'block'
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Logo */}
            {logoSrc && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={`https://res.cloudinary.com/dippj70ao/image/upload/a_270,h_${data.headshotContainerSize},c_scale/v1763925891/skyhi-og-image-black_iychjj.png`}
                        alt="SkyHi AI"
                        height={data.headshotContainerSize}
                        style={{
                            height: `${data.headshotContainerSize}px`,
                            width: 'auto',
                            display: 'block',
                            border: '0'
                        }}
                    />
                </div>
            )}

            {/* Blue Divider - full height of container */}
            <div style={{ width: '3px', backgroundColor: '#3B82F6' }}></div>

            {/* Info - spread evenly within fixed height */}
            <div style={{ 
                paddingLeft: '10px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                height: '100%'
            }}>
                <div>
                    <strong style={{ fontSize: '18px', color: '#000000', display: 'block', fontWeight: '900', lineHeight: '1.2' }}>{data.fullName}</strong>
                    <span style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{data.title}</span>
                </div>
                <div>
                    {data.phone && (
                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>P:</span> <a href={`tel:${data.phone}`} style={{ color: '#333333', textDecoration: 'none' }}>{data.phone}</a>
                        </div>
                    )}
                    {data.email && (
                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>E:</span> <a href={`mailto:${data.email}`} style={{ color: '#333333', textDecoration: 'none' }}>{data.email}</a>
                        </div>
                    )}
                    {data.website && (
                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>W:</span> <a href={`https://${data.website}`} style={{ color: '#333333', textDecoration: 'none' }}>{data.website}</a>
                        </div>
                    )}
                    {data.address && (
                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>A:</span> {data.address}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignaturePreview;
