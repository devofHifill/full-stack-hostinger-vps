export default function Header({ toggleSidebar }) {

  return (

    <div className="header">

      <button
        className="hamburger"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <div>
        <h1>SEB Voice Monitor</h1>
        <p>Monitor call and chat activity</p>
      </div>

    </div>

  );

}