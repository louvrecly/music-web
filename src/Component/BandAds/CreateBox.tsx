import * as React from 'react'
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';

import "./BandAds.css";

interface Props {
    bandToggle: () => void
    adsToggle: () => void
}

class CreateBox extends React.Component<Props> {


    render() {
        return (
            <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 createAdsBand">
                <h3>Create Ads for your Band</h3>
                <div className="bandButton" id="createAds" onClick={this.props.adsToggle}>
                    Recruit
                 </div>
                <h3>Create your own Band</h3>
                <div className="bandButton" id="createBand" onClick={this.props.bandToggle}>
                    Create
                </div>
            </div>


        )
    }
}

export default connect((state: IRootState) => {
    return {
    }
}, (dispatch: ThunkDispatch) => {
    return {
        
    }
})(CreateBox);