import React, { useRef } from 'react';

const SignaturePreview = ({ data }) => {
    const signatureRef = useRef(null);

    const getLogoSrc = () => {
        if (data.logo === 'show') return 'https://res.cloudinary.com/dippj70ao/image/upload/v1763925891/skyhi-og-image-black_iychjj.png';
        return null;
    };

    const logoSrc = getLogoSrc();

    const hiddenCopyRef = useRef(null);

    const copyToClipboard = () => {
        if (!hiddenCopyRef.current) return;

        // We need to copy the HTML content from the hidden, email-optimized version
        const html = hiddenCopyRef.current.innerHTML;

        // Use the Clipboard API to write HTML
        const blob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([hiddenCopyRef.current.innerText], { type: 'text/plain' });

        const item = new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob
        });

        navigator.clipboard.write([item]).then(() => {
            alert('Signature copied to clipboard! Paste it into Gmail settings.');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy. Please try selecting and copying manually.');
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Preview</h2>
                <button className="btn btn-primary" onClick={copyToClipboard}>
                    Copy Signature
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
                Note: Logos are loaded from Cloudinary and will work properly in all email clients.
                Headshots are automatically uploaded to Cloudinary when you select an image.
            </p>
        </div>
    );
};

const SignatureContent = ({ data, logoSrc, isForCopy }) => {
    // Spacing values based on context
    const titlePaddingBottom = isForCopy ? '18px' : '10px';
    const nameMarginBottom = isForCopy ? '2px' : '0px';
    const rowPaddingBottom = isForCopy ? '5px' : '2px';

    // Gmail cannot clip images - use Cloudinary to pre-crop server-side
    const getEmailCroppedUrl = (url) => {
        if (!url || !url.includes('cloudinary.com')) return url;
        
        const size = data.headshotContainerSize;
        const scale = data.headshotImageScale / 100;
        
        // Calculate the crop window size (inverse of scale)
        const cropSize = Math.round(size / scale);
        
        // Calculate offset based on X/Y position (0-100 where 50 is center)
        // The offset should move the crop window, not the image
        const maxOffset = Math.max(0, cropSize - size);
        const xOffset = Math.round((data.headshotX / 100) * maxOffset);
        const yOffset = Math.round((data.headshotY / 100) * maxOffset);
        
        // Build Cloudinary transformation URL
        const urlParts = url.split('/upload/');
        if (urlParts.length === 2) {
            // c_crop extracts a region, then c_fill resizes to exact dimensions
            return `${urlParts[0]}/upload/c_fill,w_${size},h_${size},g_xy_center,x_${xOffset},y_${yOffset},z_${scale}/${urlParts[1]}`;
        }
        return url;
    };

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

    return (
        <table cellPadding="0" cellSpacing="0" border="0" style={{ borderCollapse: 'collapse' }}>
            <tbody>
                <tr>
                    {/* Headshot Column */}
                    {data.showHeadshot && data.headshotUrl && (
                        <td style={{ paddingRight: '10px', verticalAlign: 'top' }}>
                            {isForCopy ? (
                                // EMAIL VERSION: Simple img with Cloudinary pre-cropped image
                                // Gmail ignores overflow:hidden, so we MUST pre-crop server-side
                                <img
                                    src={getEmailCroppedUrl(data.headshotUrl)}
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
                                // PREVIEW VERSION: CSS-based positioning (works in browsers)
                                <div style={{
                                    width: `${data.headshotContainerSize}px`,
                                    height: `${data.headshotContainerSize}px`,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'inline-block',
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
                        </td>
                    )}

                    {/* Logo Column (Vertical) */}
                    {logoSrc && (
                        <td style={{ padding: '0', verticalAlign: 'top' }}>
                            <img
                                src={`https://res.cloudinary.com/dippj70ao/image/upload/a_270,h_${data.headshotContainerSize},c_fit/v1763925891/skyhi-og-image-black_iychjj.png`}
                                alt="SkyHi AI"
                                height={data.headshotContainerSize}
                                style={{
                                    height: `${data.headshotContainerSize}px`,
                                    width: 'auto',
                                    display: 'block',
                                    border: '0'
                                }}
                            />
                        </td>
                    )}

                    {/* Border Column - solid color for Gmail compatibility */}
                    <td style={{ width: '3px', padding: '0', backgroundColor: '#3B82F6' }}>
                        <div style={{ width: '3px', height: `${data.headshotContainerSize}px`, backgroundColor: '#3B82F6' }}></div>
                    </td>

                    {/* Info Column */}
                    <td style={{ verticalAlign: 'top', paddingLeft: '10px' }}>
                        <table cellPadding="0" cellSpacing="0" border="0">
                            <tbody>
                                <tr>
                                    <td style={{ paddingBottom: titlePaddingBottom }}>
                                        <strong style={{ fontSize: '18px', color: '#000000', display: 'block', fontWeight: '900', marginBottom: nameMarginBottom }}>{data.fullName}</strong>
                                        <span style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{data.title}</span>
                                    </td>
                                </tr>
                                {data.phone && (
                                    <tr>
                                        <td style={{ fontSize: '13px', color: '#64748b', paddingBottom: rowPaddingBottom }}>
                                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>P:</span> <a href={`tel:${data.phone}`} style={{ color: '#333333', textDecoration: 'none' }}>{data.phone}</a>
                                        </td>
                                    </tr>
                                )}
                                {data.email && (
                                    <tr>
                                        <td style={{ fontSize: '13px', color: '#64748b', paddingBottom: rowPaddingBottom }}>
                                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>E:</span> <a href={`mailto:${data.email}`} style={{ color: '#333333', textDecoration: 'none' }}>{data.email}</a>
                                        </td>
                                    </tr>
                                )}
                                {data.website && (
                                    <tr>
                                        <td style={{ fontSize: '13px', color: '#64748b', paddingBottom: rowPaddingBottom }}>
                                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>W:</span> <a href={`https://${data.website}`} style={{ color: '#333333', textDecoration: 'none' }}>{data.website}</a>
                                        </td>
                                    </tr>
                                )}
                                {data.address && (
                                    <tr>
                                        <td style={{ fontSize: '13px', color: '#64748b' }}>
                                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>A:</span> {data.address}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table >
    );
};

export default SignaturePreview;
