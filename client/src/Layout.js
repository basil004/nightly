import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
    return (
        <div className="app-container">
            <Header />
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}