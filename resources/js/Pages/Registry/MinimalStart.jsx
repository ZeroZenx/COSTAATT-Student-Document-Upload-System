export default function MinimalStart() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: 'green', fontSize: '24px' }}>REGISTRY START PAGE</h1>
            <p style={{ color: 'black', fontSize: '16px' }}>
                This is a minimal Registry Start page to test if the route works.
            </p>
            <form>
                <input type="text" placeholder="Student ID" style={{ padding: '10px', margin: '5px' }} />
                <br />
                <input type="email" placeholder="Email" style={{ padding: '10px', margin: '5px' }} />
                <br />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none' }}>
                    Continue
                </button>
            </form>
        </div>
    );
}
