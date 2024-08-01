import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [file, setFile] = useState(null);
  const [parsedContent, setParsedContent] = useState([]);
  const [error, setError] = useState('');

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const onFileUpload = async () => {
    if (!file) {
      setError('파일을 선택해 주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/upload', formData);
      setParsedContent(res.data.data);
    } catch (err) {
      console.error(err);
      setError('파일 업로드에 실패했습니다.');
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload</button>
      {error && <div className="error-message">{error}</div>}
      {parsedContent.length > 0 && (
        <div>
          <h3>신·구조문 대비</h3>
          <table className="comparison-table">
            <tbody>
              {parsedContent.map((comparison, index) => (
                <tr key={index} className={index === 0 ? "header" : ""}>
                  <td>{comparison[0]}</td>
                  <td>{comparison[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
