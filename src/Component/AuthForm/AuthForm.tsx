import React from 'react';
import { MsgInfo, AuthFormType } from '../../models';
import { Card, CardHeader, CardBody, CardFooter, Button, Label, Input, Form, FormGroup, Alert, Nav, NavItem, NavLink } from 'reactstrap';
import { IRootState, ThunkDispatch } from '../../store';
import { login, register } from '../../redux/authForm/thunks';
import { connect } from 'react-redux';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
// import boy from "../../resources/boy.mp4"
import band from "../../resources/band.mp4";
import "./AuthForm.css";


interface IAuthFormProps {
    msgInfo: MsgInfo | null,
    login: (useranme: string, password: string) => void,
    register: (username: string, password: string) => void
}

interface IAuthFormStates {
    formType: AuthFormType,
    username: string,
    password: string,
    videoUrl:string
}

class AuthForm extends React.Component<IAuthFormProps, IAuthFormStates> {

    constructor(props: IAuthFormProps) {
        super(props);
        this.state = {
            formType: "login",
            username: "",
            password: "",
            videoUrl: band
        }
    }

    private switchFormType = (formType: AuthFormType, event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        this.setState({ formType });
    }

    private onTextInput = (field: "username" | "password", event: React.ChangeEvent<HTMLInputElement>) => {
        const textInput: any = Object.assign({}, { [field]: event.currentTarget.value });
        this.setState(textInput);
    }

    private onSubmitAuth = async (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        const { formType, username, password } = this.state;
        switch (formType) {
            case "login": 
                return await this.props.login(username, password);
            case "register": 
                return await this.props.register(username, password);
            default: 
                console.log(`Invalid formType: ${formType}`);
        }
    }

    public render() {
        let submitText: string;
        let submitColor: string;
        switch(this.state.formType) {
            case "login": 
                submitText = "Sign In";
                submitColor = "success";
                break;
            case "register": 
                submitText = "Register";
                submitColor = "primary";
                break;
            default: 
                submitText = "";
                submitColor = "secondary";
                console.log(`Invalid formType: ${this.state.formType}`);
        }
        return (
            <div className="video-header wrap">
            <div className="fullscreen-video-wrap">
                <video src={this.state.videoUrl} autoPlay loop muted></video>
            </div>
            <div className="auth-form-content">
                <Form className="auth-form">
                    <Card className="auth-card">
                        <CardHeader className="auth-card-header">
                            <Nav tabs>
                                <NavItem>
                                    <NavLink href="#" active={this.state.formType === "login"} onClick={this.switchFormType.bind(this, "login")}>Login</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" active={this.state.formType === "register"} onClick={this.switchFormType.bind(this, "register")}>Register</NavLink>
                                </NavItem>
                            </Nav>
                        </CardHeader>
                        <CardBody className="auth-card-body">
                            <FormGroup>
                                <Label for="username">
                                    Username:
                                </Label>
                                <Input type="text" className="auth-form-username" placeholder="username" onChange={this.onTextInput.bind(this, "username")} value={this.state.username} required={true} />
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">
                                    Password:
                                </Label>
                                <Input type="password" className="auth-form-password" placeholder="password" onChange={this.onTextInput.bind(this, "password")} value={this.state.password} required={true} />
                            </FormGroup>
                            {this.props.msgInfo && 
                                <Alert color={this.props.msgInfo.isSuccess ? "success" : "danger"}>
                                    {this.props.msgInfo.isSuccess ? <FaCheckCircle /> : <FaExclamationCircle />}{this.props.msgInfo.msg}
                                </Alert>}
                        </CardBody>
                        <CardFooter className="auth-card-footer">
                            <Button className="auth-card-submit" color={submitColor} onClick={this.onSubmitAuth}>
                                {submitText}
                            </Button>
                        </CardFooter>
                    </Card>
                </Form>
            </div>
            </div>
        );
    }

}

const mapStateToProps = (state: IRootState) => {
    return {
        msgInfo: state.auth.msgInfo
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        login: (username: string, password: string) => dispatch(login(username, password)),
        register: (username: string, password: string) => dispatch(register(username, password))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthForm);