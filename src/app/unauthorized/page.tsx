import React from 'react';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-lg text-muted-foreground mb-6">
          You do not have permission to access this page.<br />
          Please login with the correct account or return to the homepage.
        </p>
        <a href="/" className="inline-block px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">Go Home</a>
      </div>
    </div>
  );
}
