import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Input, ButtonGroup, Label } from 'reactstrap';
import { connect } from 'react-redux';
import { ThunkDispatch, IRootState } from '../../store';
import { remoteUploadBand, remoteLoadMyBand, remoteEditBand } from '../../redux/Band/action';
import { FaExclamationCircle } from 'react-icons/fa';
import { Band } from '../../models';

interface IEditModalProps {
    myBand: Band | null
    modal: boolean
    loadMyBand:() => void
    editToggle: () => void
    editBand: (bandId: number, bandName: string, bandLogo: string) => void
    uploadBand: (file: File | null) => void
    imgSrc: string
    msgInfo: string | null
}

interface IEditModalState {
    bandNameInput: string,
    file: File | null,
    fileName: string
    previewURL: string|undefined
}


class EditModal extends React.Component<IEditModalProps, IEditModalState>{

    state: IEditModalState = {
        bandNameInput: this.props.myBand ? this.props.myBand.name : "",
        file: null,
        fileName: "",
        previewURL: this.props.myBand? this.props.myBand.band_img : ""
    } 
    
    async componentDidMount(){
        await this.props.loadMyBand()
            this.setState({ 
                bandNameInput: this.props.myBand ? this.props.myBand.name : "",
                previewURL: this.props.myBand? this.props.myBand.band_img : ""
            })
    }

    private onEditBandInput = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const input: any = Object.assign({}, { [field]: event.currentTarget.value })
        this.setState(input);
    }

    private onEditBand = () => {
            this.props.editBand(this.props.myBand!.id!, this.state.bandNameInput, this.props.imgSrc)
    }

    private editToggle = () => {
        this.props.editToggle()
        this.setState({
            fileName: '',
            previewURL: this.props.myBand!.band_img ? this.props.myBand!.band_img : ""
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
            <Modal isOpen={this.props.modal} centered={true} toggle={this.editToggle}>
                <ModalHeader>Edit your Band</ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="form-group col-6">
                            <label htmlFor="bandName">Band Name</label>
                            <Input type="text" value={this.state.bandNameInput} onChange={this.onEditBandInput.bind(this, "bandNameInput")} placeholder="Enter your band's name" />
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
                    <Button color="danger" onClick={this.editToggle}>Close</Button>
                    <Button color="primary" onClick={this.onEditBand}>Edit</Button>
                </ModalFooter>
            </Modal>
        )
    }
}


export default connect((state: IRootState) => {
    return {
        myBand:state.band.myBand,
        msgInfo: state.band.msgInfo,
        imgSrc: state.band.imgSrc
    }
}
    , (dispatch: ThunkDispatch) => {
        return {
            loadMyBand: () => dispatch(remoteLoadMyBand()),
            editBand: (bandId: number, bandName: string, bandLogo: string) => dispatch(remoteEditBand(bandId, bandName, bandLogo)),
            uploadBand: (file: File | null) => dispatch(remoteUploadBand(file))
        }
    })(EditModal);