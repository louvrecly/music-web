import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';
import { FaExclamationCircle } from 'react-icons/fa';
import { BandAds } from '../../models';
import { remoteResponseAds, remoteDeleteAds } from '../../redux/Band/action';
import "./BandAds.css";
import styles from './BandAds.module.css';


interface ICreatAdsModalProps {
    bandAds:BandAds | null,
    modal: boolean,
    msgInfo: string | null,
    bandId : number | undefined,
    viewAdToggle: () => void,
    responseAds: (adId:number, message:string) => void,
    deleteAds:(id:number) => void
}

interface IViewAdModalState {
    messageInput: string
}


class ViewAdModal extends React.Component<ICreatAdsModalProps, IViewAdModalState>{


    state: IViewAdModalState = {
        messageInput: "",
    }

    private onMessageInput = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const input: any = Object.assign({}, { [field]: event.currentTarget.value })
        this.setState(input);
    }

    private onResponseAds = (adId:number, message:string) => {
        this.props.responseAds(adId, message)
    }

    private onDeleteAds = (adId:number) => {
        this.props.deleteAds(adId)
    }


    public render() {
        return (
            <Modal isOpen={this.props.modal} centered={true} toggle={this.props.viewAdToggle}>
                <ModalHeader>Wanted ad</ModalHeader>
                <ModalBody>
                    <div className="form-group">
                        <div className="row">
                            <div className="col">
                                <h5>{this.props.bandAds && this.props.bandAds.name}</h5>
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col-5">
                                Band
                         </div>
                            <div className="col-4" style={{ color: '#ff790d' }}>
                            {this.props.bandAds && this.props.bandAds.bandName}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-5">
                                Description
                        </div>
                            <div className="col-4">
                            {this.props.bandAds && this.props.bandAds.description}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-5">
                                Message
                            </div>
                            <div className="col-4">
                            {this.props.bandAds && this.props.bandAds.message}
                            </div>
                        </div> 
                        <div className="row">
                            <div className="col-5">
                                Instruments
                        </div>
                            <div className="col-4">
                            {this.props.bandAds && this.props.bandAds.instruments.replace(/["}{}]/g,"")}
                            </div>
                        </div>
                        {this.props.bandAds && this.props.bandId !== this.props.bandAds.band_id ? 
                        <div className="row">
                            <div className="col-5">
                                Message to founder
                        </div>
                            <div className="col-6">
                                <Input type="text" id="msgToBand" value={this.state.messageInput} onChange={this.onMessageInput.bind(this,'messageInput')}/>
                            </div>
                        </div> : null 
                        }
                    </div>
                    <div className={styles.bandName}>

                    </div>
                </ModalBody>
                <ModalFooter>
                    {this.props.msgInfo && <Alert color="danger"><FaExclamationCircle />{this.props.msgInfo}</Alert>}
                    <Button color="danger" onClick={this.props.viewAdToggle}>Close</Button>
                    {this.props.bandAds && this.props.bandId !== this.props.bandAds.band_id ?
                    <Button color="primary" onClick={this.onResponseAds.bind(this, this.props.bandAds!.id!, this.state.messageInput)}>Submit</Button> : null
                    }
                    {this.props.bandAds && this.props.bandId === this.props.bandAds.band_id?
                    <Button color="warning" onClick={this.onDeleteAds.bind(this, this.props.bandAds!.id!)}>Delete</Button> : null
                    }
                    
                </ModalFooter>
            </Modal>
        )
    }
}

export default connect((state: IRootState) => {
    return {
        msgInfo: state.band.msgInfo
    }
}
    , (dispatch: ThunkDispatch) => {
        return {
            responseAds: (adId:number, message:string) => dispatch(remoteResponseAds(adId, message)),
            deleteAds: (id:number) => dispatch(remoteDeleteAds(id))

        }
    })(ViewAdModal);