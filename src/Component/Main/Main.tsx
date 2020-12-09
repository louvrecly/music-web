import * as React from 'react'
import MyBand from './MyBand';
import "./Main.css";
import BandStudio from './BandStudio';
import MyTrack from './MyTrack';
import MyMidi from './MyMidi';

const Main: React.FC = () => {
    return (

        <div className="mainContent">
            <div className='row'>
                <MyBand />
                <BandStudio /> 
            </div>
            <div className='row'>
                <MyTrack />
                <MyMidi />
            </div>
        </div>
    )
}

export default Main;