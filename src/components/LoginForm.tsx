import React from 'react';

export const LoginForm: React.FC = () => {
  return (
    <form>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-control"
          autoComplete="email"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="form-control"
          autoComplete="current-password"
          required
        />
      </div>
      
      <button type="submit">Log In</button>
    </form>
  );
};

export default LoginForm; 