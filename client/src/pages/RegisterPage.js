import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function register(ev) {
        ev.preventDefault();
        try {
            setError(''); // Clear any previous errors
            
            // Validate input
            if (!username || !password) {
                setError('Username and password are required');
                return;
            }
            
            if (password.length < 4) {
                setError('Password must be at least 4 characters long');
                return;
            }

            const response = await fetch('http://localhost:4000/register', {
                method: 'POST',
                body: JSON.stringify({username, password}),
                headers: {'Content-Type':'application/json'},
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Registration successful');
                setUsername('');
                setPassword('');
            } else {
                setError(data || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Network error - please check if the server is running');
        }
    }

    return(
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            {error && (
                <div style={{color: 'red', marginBottom: '10px'}}>
                    {error}
                </div>
            )}
            <input type="text" 
                placeholder="username" 
                value={username} 
                onChange={ev => setUsername(ev.target.value)}/>
            <input type="password" 
                placeholder="password"
                value={password}
                onChange={ev => setPassword(ev.target.value)}/>
            <button>Register</button>
        </form>    
    );    
}