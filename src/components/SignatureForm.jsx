import React from 'react';

const SignatureForm = ({ data, onChange, onImageUpload }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Read file as data URL for local preview only
            // Upload happens later when "Copy Signature" is clicked
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageUpload(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Employee Details</h2>

            <div className="input-group">
                <label className="label">Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={data.fullName}
                    onChange={onChange}
                    className="input"
                    placeholder="e.g. John Doe"
                />
            </div>

            <div className="input-group">
                <label className="label">Job Title</label>
                <input
                    type="text"
                    name="title"
                    value={data.title}
                    onChange={onChange}
                    className="input"
                    placeholder="e.g. AI Solutions Engineer"
                />
            </div>

            <div className="input-group">
                <label className="label">Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={onChange}
                    className="input"
                    placeholder="john@skyhiai.com"
                />
            </div>

            <div className="input-group">
                <label className="label">Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    value={data.phone}
                    onChange={onChange}
                    className="input"
                    placeholder="555-0123"
                />
            </div>

            <div className="input-group">
                <label className="label">Website</label>
                <input
                    type="text"
                    name="website"
                    value={data.website}
                    onChange={onChange}
                    className="input"
                    placeholder="www.skyhiai.com"
                />
            </div>

            <div className="input-group">
                <label className="label">Address</label>
                <input
                    type="text"
                    name="address"
                    value={data.address}
                    onChange={onChange}
                    className="input"
                    placeholder="123 Innovation Drive"
                />
            </div>

            <h3 style={{ margin: '2rem 0 1rem' }}>Media</h3>



            <div className="input-group">
                <label className="label">Headshot</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="input"
                        style={{ flex: 1 }}
                    />
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="showHeadshot"
                            checked={data.showHeadshot}
                            onChange={onChange}
                        />
                        <span className="label" style={{ marginBottom: 0 }}>Show Headshot</span>
                    </label>
                </div>
                {data.headshotUrl && (
                    <div style={{ marginTop: '1rem' }}>

                        <div style={{ marginTop: '1rem' }}>
                            <label className="label">Image Scale ({data.headshotImageScale}%)</label>
                            <input
                                type="range"
                                name="headshotImageScale"
                                min="100"
                                max="300"
                                value={data.headshotImageScale}
                                onChange={onChange}
                                className="input"
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label className="label">Shape</label>
                            <select
                                name="headshotShape"
                                value={data.headshotShape}
                                onChange={onChange}
                                className="input"
                            >
                                <option value="circle">Circle</option>
                                <option value="rounded">Rounded Corners</option>
                                <option value="squircle">Squircle</option>
                                <option value="leaf">Leaf</option>
                                <option value="leaf-inverse">Leaf Inverse</option>
                                <option value="left-rounded">Left Rounded</option>
                                <option value="top-left-round">Top-Left Round</option>
                                <option value="bottom-left-round">Bottom-Left Round</option>
                                <option value="left-squircle">Left Squircle</option>
                                <option value="diamond-square">Diamond-Square</option>
                                <option value="diamond-rounded">Diamond-Rounded</option>
                                <option value="diamond-squircle">Diamond-Squircle</option>
                                <option value="octagon-square">Octagon-Square</option>
                                <option value="octagon-rounded">Octagon-Rounded</option>
                                <option value="octagon-squircle">Octagon-Squircle</option>
                                <option value="hexagon-square">Hexagon-Square</option>
                                <option value="hexagon-rounded">Hexagon-Rounded</option>
                                <option value="hexagon-squircle">Hexagon-Squircle</option>
                                <option value="hexagon">Hexagon</option>
                                <option value="pentagon">Pentagon</option>
                                <option value="octagon">Octagon</option>
                                <option value="message">Message Bubble</option>
                                <option value="message-inverse">Message Bubble Inverse</option>
                                <option value="diamond">Diamond</option>
                                <option value="square">Square</option>
                            </select>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label className="label">Position X ({data.headshotX}%)</label>
                            <input
                                type="range"
                                name="headshotX"
                                min="0"
                                max="100"
                                value={data.headshotX}
                                onChange={onChange}
                                className="input"
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label className="label">Position Y ({data.headshotY}%)</label>
                            <input
                                type="range"
                                name="headshotY"
                                min="0"
                                max="100"
                                value={data.headshotY}
                                onChange={onChange}
                                className="input"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignatureForm;
