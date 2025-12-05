import React, { useState } from 'react';
import SignatureForm from './components/SignatureForm';
import SignaturePreview from './components/SignaturePreview';

function App() {
  const [data, setData] = useState({
    fullName: 'John Doe',
    title: 'AI Solutions Engineer',
    email: 'john.doe@skyhi.ai',
    phone: '555-0123',
    website: 'www.skyhi.ai',
    address: '123 Innovation Drive, Suite 100',
    logo: 'show', // 'show' or 'none'
    headshotUrl: '',
    showHeadshot: true,
    headshotContainerSize: 135, // Fixed circle/container size
    headshotImageScale: 100, // Scale of the image inside (%)
    headshotShape: 'circle', // 'circle', 'rounded', 'square'
    headshotX: 50,
    headshotY: 50
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (url) => {
    setData(prev => ({ ...prev, headshotUrl: url }));
  };

  return (
    <div className="container">
      <h1>SkyHi AI Signature Generator</h1>
      <div className="grid-2">
        <div className="card">
          <SignatureForm
            data={data}
            onChange={handleChange}
            onImageUpload={handleImageUpload}
          />
        </div>
        <div className="card" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
          <SignaturePreview data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
