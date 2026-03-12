import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../CallLogsDashboard.css"


export default function Dashboard() {
  return (
    <div className="layout">

      <Sidebar/>

      <main className="main">

        <Header/>

        <Outlet/>

      </main>

    </div>
  );

}