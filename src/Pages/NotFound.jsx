import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fcfcfc',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <img
        src="/404img.png"
        alt="404 Not Found"
        style={{ maxWidth: '640px', width: '100%', height: 'auto' }}
      />
      {/* <p style={{ marginTop: '24px', fontSize: '18px', color: '#2f2e41', fontWeight: 500 }}>
        Something went wrong please return to homepage
      </p> */}
      <button
        onClick={() => navigate('/', { replace: true })}
        style={{
          marginTop: '20px',
          padding: '12px 48px',
          borderRadius: '999px',
          border: 'none',
          background: '#2f2e41',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
        }}
      >
        Home
      </button>
    </div>
  )
}