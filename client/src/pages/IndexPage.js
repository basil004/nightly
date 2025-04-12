import { useEffect, useState } from "react";
import Post from "../Post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        console.log('Fetching posts...');
        fetch('http://localhost:4000/post')
            .then(async response => {
                console.log('Received response:', response.status);
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Response not OK:', text);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                }
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new TypeError("Response was not JSON");
                }
                return response.json();
            })
            .then(posts => {
                console.log('Received posts:', posts);
                if (!Array.isArray(posts)) {
                    console.error('Posts is not an array:', posts);
                    throw new Error('Invalid response format');
                }
                setPosts(posts);
                setError('');
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                setError(`Failed to load posts: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading posts...</div>;
    }

    if (error) {
        return (
            <div>
                <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>
                <button onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="posts-container">
            {posts.length > 0 ? (
                posts.map(post => (
                    <Post key={post._id} {...post} />
                ))
            ) : (
                <p>No posts found</p>
            )}
        </div>    
    );
}