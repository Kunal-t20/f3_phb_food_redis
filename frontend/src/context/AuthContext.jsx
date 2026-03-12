import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const fullname = localStorage.getItem('fullname');
        if (token && role) {
            setUser({ token, role, fullname });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await loginUser({ email, password });
        const { access_token, role } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('role', role);
        setUser({ token: access_token, role });
        return role;
    };

    const register = async (data) => {
        const res = await registerUser(data);
        localStorage.setItem('fullname', res.data.fullname);
        return res.data;
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
