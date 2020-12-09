import React from "react";
import moment from "moment";
import { Container, Row, Col, Form, Button, Input, ButtonGroup, Label } from "reactstrap";
import { loadPlayer, editplayerInfo, uploadProfile } from "../../redux/profile/thunks";
import { browseFile } from "../../redux/profile/actions";
import { Player } from "../../models";
import { IRootState, ThunkDispatch } from "../../store";
import { connect } from "react-redux";
import "./PlayerProfile.css";


// const { REACT_APP_API_SERVER } = process.env;

interface IProfileProps {
    player: Player,
    imgSrc: string,
    msgInfo: string,
    loadPlayer: () => void,
    browseFile: (fileName: string) => void,
    uploadProfile: (file: File | null) => void,
    // uploadProfile: (player: Player, file: File | null) => void,
    editPlayerInfo: (editedPlayer: Player) => void
}

interface IProfileStates {
    editMode: boolean,
    nameInput: string,
    file: File | null
}

class PlayerProfile extends React.Component<IProfileProps, IProfileStates> {

    constructor(props: IProfileProps) {
        super(props);
        this.state = {
            editMode: false,
            nameInput: "",
            file: null
        };
    }

    private onTextInput = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const textInput: any = Object.assign({}, { [field]: event.currentTarget.value });
        this.setState(textInput);
    }

    // private onImgBrowse = (event: React.MouseEvent<any, MouseEvent>) => {

    // }

    private onFileBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const file: File = files[0];
            if (file) {
                this.setState({
                    file
                });
                const fileName = file.name;
                this.props.browseFile(fileName);
            } else {
                console.log("invalid file");
            }
        }
    }

    private onImgUpload = (event: React.MouseEvent<any, MouseEvent>) => {
        // const { player } = this.props;
        const { file } = this.state;
        this.props.uploadProfile(file);
        // this.props.uploadProfile(player, file);
    }

    private onEditInfo = async (event: React.MouseEvent<any, MouseEvent>) => {
        const editedPlayer = {
            ...this.props.player,
            name: this.state.nameInput
        };
        console.log({ editedPlayer });
        await this.props.editPlayerInfo(editedPlayer);
        this.setState({
            editMode: !this.state.editMode
        });
    }

    public async componentDidMount() {
        await this.props.loadPlayer();
        this.setState({
            nameInput: this.props.player.name
        });
    }

    public render() {
        return (
            <div className="profile-content">
                <Container className="profile-container">
                    <Row className="profile-head-row">
                        <Col className="profile-head">
                            <h1>Player Profile</h1>
                        </Col>
                    </Row>
                    <Row className="player-info-row">
                        <Col md="4" className="player-info">
                            <Form className="player-img-form">
                                <div className="img-div">
                                    <img className="player-img" src={this.props.imgSrc} alt={this.state.nameInput}></img>
                                    {/* <img className="player-img" src={`${REACT_APP_API_SERVER}/protected/uploads${this.props.player.profile_img}`} alt={this.props.player.name}></img> */}
                                </div>
                                <ButtonGroup className="img-control">
                                    {/* <Button className="img-browse" color="outline-primary" onClick={this.onImgBrowse.bind(this)}>Browse</Button> */}
                                    <Label className="img-browse btn-outline-primary" color="outline-primary">
                                        <Input className="img-file" type="file" onChange={this.onFileBrowse.bind(this)} />
                                        Browse
                                    </Label>
                                    <Button className="img-upload" color="outline-primary" onClick={this.onImgUpload.bind(this)}>Upload</Button>
                                </ButtonGroup>
                                <div className="msg-info">{this.props.msgInfo}</div>
                                {/* <Input className="msg-info" type="text" value={this.props.msgInfo} readOnly={true} /> */}
                            </Form>
                            <Form className="player-info-form">
                                <Input className={`player-name ${this.state.editMode ? "edit-name" : ""}`} type="text" onChange={this.onTextInput.bind(this, "nameInput")} value={this.state.nameInput} readOnly={!this.state.editMode} />
                                {/* <Input className={`player-name ${this.state.editMode ? "edit-name" : ""}`} type="text" onChange={this.onTextInput.bind(this, "nameInput")} defaultValue={this.props.player.name} value={this.state.nameInput} readOnly={!this.state.editMode} /> */}
                                <Row form>
                                    <Col sm={6}>
                                        <Input className="player-gender" type="text" value={`Gender: ${this.props.player.gender}`} readOnly={true} />
                                    </Col>
                                    <Col sm={6}>
                                        <Input className="player-age" type="text" value={`Age: ${moment(new Date()).diff(moment(this.props.player.date_of_birth), 'years')}`} readOnly={true} />
                                    </Col>
                                </Row>
                                <Button className="edit-save" color="outline-light" onClick={this.onEditInfo.bind(this)}>{this.state.editMode ? "Save" : "Edit"}</Button>
                            </Form>
                        </Col>
                        <Col md="8" className="music-info">
                            <div className="band-instrument-info">
                                <h4>Bands and Instruments</h4>
                            </div>
                            <div className="album-song-info">
                                <h4>Albums and Songs</h4>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );

    }

}

const mapStateToProps = (state: IRootState) => {
    return {
        player: state.profile.player,
        imgSrc: state.profile.imgSrc,
        msgInfo: state.profile.msgInfo
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        loadPlayer: () => dispatch(loadPlayer()),
        browseFile: (fileName: string) => dispatch(browseFile(fileName)),
        uploadProfile: (file: File | null) => dispatch(uploadProfile(file)),
        // uploadProfile: (player: Player, file: File) => dispatch(uploadProfile(player, file)),
        editPlayerInfo: (editedPlayer: Player) => dispatch(editplayerInfo(editedPlayer))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerProfile);