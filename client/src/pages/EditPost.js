import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import CustomEditor from "../Editor";

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`http://localhost:4000/post/${id}`);
                if (!response.ok) {
                    throw new Error('Post not found');
                }
                const postInfo = await response.json();
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
            } catch (error) {
                console.error('Error fetching post:', error);
                setError(error.message);
            }
        };

        fetchPost();
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        if (files?.[0]) {
            data.set('file', files[0]);
        }
    
        try {
            const response = await fetch(`http://localhost:4000/post/${id}`, {
                method: 'PUT',
                body: data,
                credentials: 'include',
            });
    
            const contentType = response.headers.get('content-type');
            let responseData;
    
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }
    
            if (!response.ok) {
                console.error('Update failed:', responseData);
                throw new Error(responseData.message || responseData || 'Failed to update post');
            }
    
            setRedirect(true);
        } catch (error) {
            console.error('Error updating post:', error);
            setError(error.message);
        }
    }

    if (redirect) {
        return <Navigate to={`/post/${id}`} />;
    }

    return (
        <form onSubmit={updatePost}>
            <h1>Edit Post</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
            />
            <input
                type="text"
                placeholder="Summary"
                value={summary}
                onChange={ev => setSummary(ev.target.value)}
            />
            <input
                type="file"
                onChange={ev => setFiles(ev.target.files)}
            />
            <CustomEditor
                value={content}
                onChange={setContent}
            />
            <button style={{ marginTop: '5px' }}>Update Post</button>
        </form>
    );
}