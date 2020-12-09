import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Input, ButtonGroup, Label } from 'reactstrap';
import { connect } from 'react-redux';
import { ThunkDispatch, IRootState } from '../../store';
import { remoteCreateBand, remoteUploadBand } from '../../redux/Band/action';
import { FaExclamationCircle } from 'react-icons/fa';
import "./BandAds.css";

interface ICreatBandModalProps {
    modal: boolean,
    bandToggle: () => void
    createBand: (bandName: string, bandLogo: string) => void
    uploadBand: (file: File | null) => void
    imgSrc: string
    msgInfo: string | null
}

interface ICreatBandModalState {
    bandNameInput: string,
    checkInput: boolean,
    file: File | null,
    fileName: string
    previewURL: string|undefined
}


class CreatBandModal extends React.Component<ICreatBandModalProps, ICreatBandModalState>{

    state: ICreatBandModalState = {
        bandNameInput: "",
        checkInput: true,
        file: null,
        fileName: "",
        previewURL:undefined
    }

    private onCreateBandInput = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const input: any = Object.assign({}, { [field]: event.currentTarget.value })
        this.setState(input);
    }

    private onCreateBand = () => {
        if (this.state.bandNameInput && this.props.imgSrc) {
            this.setState({
                checkInput: true
            })
            this.props.createBand(this.state.bandNameInput, this.props.imgSrc)
        }
        this.setState({
            checkInput: false
        })
    }

    private bandToggle = () => {
        this.props.bandToggle()
        this.setState({
            checkInput: true,
            fileName: ''
        })
    }



    private onFileBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const file: File = files[0];
            const fileName = file.name;
            const previewURL = URL.createObjectURL(file)
            this.setState({
                file:file,
                fileName:fileName,
                previewURL:previewURL
            });
        }
    }

    private onImgUpload = (event: React.MouseEvent<any, MouseEvent>) => {
        // const { player } = this.props;
        const { file } = this.state;
        this.props.uploadBand(file);
        // this.props.uploadProfile(player, file);
    }

    public render() {
        return (
            <Modal isOpen={this.props.modal} centered={true} toggle={this.bandToggle}>
                <ModalHeader>Create your own Band</ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="form-group col-6">
                            <label htmlFor="bandName">Band Name</label>
                            <Input type="text" value={this.state.bandNameInput} onChange={this.onCreateBandInput.bind(this, "bandNameInput")} placeholder="Enter your band name" />
                            <label htmlFor="bandLogo" className="formHead">Upload your Band Logo</label>
                            <ButtonGroup className="img-control">
                                {/* <Button className="img-browse" color="outline-primary" onClick={this.onImgBrowse.bind(this)}>Browse</Button> */}
                                <Label className="img-browse btn-outline-primary" color="outline-primary">
                                    <Input className="img-file" type="file" onChange={this.onFileBrowse.bind(this)} required />
                                    Browse
                                    </Label>
                                <Button className="img-upload" color="outline-primary" onClick={this.onImgUpload.bind(this)}>Upload</Button>
                            </ButtonGroup>
                            {this.state.fileName && <Alert color="info">{this.state.fileName}</Alert>}
                        </div>
                        {this.state.previewURL &&
                        <div className="col-6 photoCenter">
                            <div >
                                <img className="player-img" src={this.state.previewURL} alt={this.state.bandNameInput}></img>
                                {/* <img className="player-img" src={`${REACT_APP_API_SERVER}/protected/uploads${this.props.player.profile_img}`} alt={this.props.player.name}></img> */}
                            </div>

                        </div>
                        }
                    </div>

                </ModalBody>
                <ModalFooter>
                    {this.props.msgInfo && <Alert color="primary"><FaExclamationCircle />{this.props.msgInfo}</Alert>}
                    {!this.state.checkInput && !this.state.bandNameInput && <Alert color="danger"><FaExclamationCircle />Please input a band name</Alert>}
                    {!this.state.checkInput && !this.props.imgSrc && <Alert color="danger"><FaExclamationCircle />Please upload a logo</Alert>}
                    <Button color="danger" onClick={this.bandToggle}>Close</Button>
                    <Button color="primary" onClick={this.onCreateBand}>Create</Button>
                </ModalFooter>
            </Modal>
        )
    }
}


export default connect((state: IRootState) => {
    return {
        msgInfo: state.band.msgInfo,
        imgSrc: state.band.imgSrc
    }
}
    , (dispatch: ThunkDispatch) => {
        return {
            createBand: (bandName: string, bandLogo: string) => dispatch(remoteCreateBand(bandName, bandLogo)),
            uploadBand: (file: File | null) => dispatch(remoteUploadBand(file))
        }
    })(CreatBandModal);