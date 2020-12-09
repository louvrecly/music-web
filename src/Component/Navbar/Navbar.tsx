import React from 'react';
import Logout from './Logout/Logout';
import { 
    // Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
     Nav } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './Navbar.css';


interface INavbarStates {
    ticTacToeDropdown: boolean,
    timerDropdown: boolean
}

class Navbar extends React.Component<{}, INavbarStates> {

    constructor(props: {}) {
        super(props);
        this.state = {
            ticTacToeDropdown: false, 
            timerDropdown: false
        };
    }

    private toggle = (dropdownField: string) => {
        const dropdownState: any = { [dropdownField]: !(this.state as any)[dropdownField] };
        this.setState(dropdownState);
    }

    public render() {
        return (
            <Nav className="nav-bar">
                <NavLink to="/" className="link">
                    <span className="logo">Lets<span className="logo-suffix">Jam</span></span>
                </NavLink>
                <NavLink to="/" className="link">Home</NavLink>
                {/* <Dropdown nav={true} isOpen={this.state.ticTacToeDropdown} toggle={this.toggle.bind(this, "ticTacToeDropdown")}>
                    <DropdownToggle nav={true} caret={true}>
                        Tic-Tac-Toe
                    </DropdownToggle>
                    <DropdownMenu>
                        <NavLink to="/play" className="link">
                            <DropdownItem>Play</DropdownItem>
                        </NavLink>
                        <NavLink to="/scoreboard" className="link">
                            <DropdownItem>Scores</DropdownItem>
                        </NavLink>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown nav={true} isOpen={this.state.timerDropdown} toggle={this.toggle.bind(this, "timerDropdown")}>
                    <DropdownToggle nav={true} caret={true}>
                        Timer
                    </DropdownToggle>
                    <DropdownMenu>
                        <NavLink to="/stopwatch" className="link">
                            <DropdownItem>Stopwatch</DropdownItem>
                        </NavLink>
                        <NavLink to="/countdown" className="link">
                            <DropdownItem>Countdown</DropdownItem>
                        </NavLink>
                    </DropdownMenu>
                </Dropdown> */}
                <NavLink to="/profile" className="link">Profile</NavLink>
                {/* <NavLink to="/chat" className="link">Chat</NavLink> */}
                <NavLink to="/band" className="link">Band</NavLink>
                {/* <NavLink to="/bandRoom/1" className="link">Band Room</NavLink> */}
                <Logout />
            </Nav>
        );
    }

}

export default Navbar;