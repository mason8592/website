import "./Style.css"
import { Link } from "react-router-dom"

function NoPage() {
    return <div className="NoPagePage">
        <div className="MessageContainer">
            <h1 className="NotFound"><b>Page not found.</b></h1>
            <h2 className="SlantyFace">:/</h2>
            <p className="NotFound">
                <small>
                    <small>
                        <Link to="/">
                            <i>take me home!</i>
                        </Link>
                    </small>
                </small>
            </p>
        </div>
    </div>
}

export default NoPage