import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "./store/slices/profileSlice";

function BootstrapApp({ children }) {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);

    useEffect(() => {
        if (token) {
            dispatch(fetchUserProfile());
        }
    }, [token, dispatch]);

    return children;
}

export default BootstrapApp;