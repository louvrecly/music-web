import React from "react";
import { Button } from "reactstrap";
import { IRootState, ThunkDispatch } from "../../../store";
import { connect } from "react-redux";
import { logout } from "../../../redux/authForm/thunks";
import "./Logout.css";


interface ILogoutProps {
    isAuthenticated: boolean,
    logout: () => void
}

class Logout extends React.Component<ILogoutProps, {}> {

    private onSignOut = (event: React.MouseEvent<any, MouseEvent>) => {
        console.log({ event });
        this.props.logout();
    }

    render() {
        return (
            <div className="logout-div">
                {this.props.isAuthenticated && <Button color="outline-light" onClick={this.onSignOut}>Sign Out</Button>}
            </div>
        );
    }
}

const mapStateToProps = (state: IRootState) => {
    return {
        isAuthenticated: state.auth.isAuthenticated
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        logout: () => dispatch(logout())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout);