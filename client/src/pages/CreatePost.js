import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Editor } from '@tinymce/tinymce-react';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState('');

    const validateFile = (file) => {
        if (!file) return false;
        
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, WebP, BMP)');
            return false;
        }

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return false;
        }

        return true;
    };

    const handleFileChange = (ev) => {
        const file = ev.target.files[0];
        if (file && validateFile(file)) {
            setFiles(ev.target.files);
            setError('');
        } else {
            ev.target.value = ''; // Clear the file input
            setFiles('');
        }
    };

    async function createNewPost(ev) {
        ev.preventDefault();
        setError('');
        
        try {
            // Validation
            if (!title || !summary || !content) {
                setError('Please fill in all fields');
                return;
            }
            
            if (!files || !files[0]) {
                setError('Please select an image');
                return;
            }

            if (!validateFile(files[0])) {
                return;
            }

            const data = new FormData();
            data.set('title', title);
            data.set('summary', summary);
            data.set('content', content);
            data.set('file', files[0]);
            
            console.log('Sending data:', {
                title,
                summary,
                contentLength: content.length,
                fileName: files[0]?.name,
                fileType: files[0]?.type,
                fileSize: files[0]?.size
            });

            const response = await fetch('http://localhost:4000/post', {
                method: 'POST',
                body: data,
                credentials: 'include',
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Post created successfully:', result);
                setRedirect(true);
            } else {
                const errorData = await response.text();
                console.error('Error creating post:', errorData);
                setError(errorData || 'Error creating post');
            }
        } catch (err) {
            console.error('Error in createNewPost:', err);
            setError('Error creating post: ' + err.message);
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }

    return (
        <form onSubmit={createNewPost}>
            <h1>Create Post</h1>
            {error && (
                <div style={{color: 'red', margin: '10px 0'}}>
                    {error}
                </div>
            )}
            <input type="title" 
                   placeholder={'Title'} 
                   value={title}
                   onChange={ev => setTitle(ev.target.value)} />
            <input type="summary"
                   placeholder={'Summary'}
                   value={summary}
                   onChange={ev => setSummary(ev.target.value)} />
            <div style={{marginBottom: '10px'}}>
                <input type="file"
                       accept="image/*"
                       onChange={handleFileChange} />
                <small style={{display: 'block', color: '#666', marginTop: '5px'}}>
                    Supported formats: JPEG, PNG, GIF, WebP, BMP (max 5MB)
                </small>
            </div>
            <Editor
                apiKey='uc2vff3zu3uzq2bp80f4gepnsvzxu9wcbi2hgrgkrzh2imhy'
                init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
                onEditorChange={(newContent, editor) => {
                    setContent(newContent);
                }}
            />
            <button style={{marginTop:'5px'}}>Create post</button>
        </form>
    );
}

