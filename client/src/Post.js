import { formatISO9075 } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Post({ 
    _id,
    title, 
    summary, 
    cover, 
    content, 
    createdAt, 
    author
}) {
    console.log('Cover image URL:', 'http://localhost:4000/' + cover);

    return (
        <div className="post">
            <div className="image">
                <Link to={`/post/${_id}`}>
                <img 
                    src={`http://localhost:4000/${cover}`}
                    alt={title}   
                    onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }}
                />
            </Link>
            </div>
            <div className="texts">
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className="info">
                    <span className="author">{author?.username || 'Unknown author'}</span>
                    <time>{formatISO9075(new Date(createdAt))}</time>
                </p>
                <p className="summary">{summary}</p>
            </div>
        </div>    
    );
}