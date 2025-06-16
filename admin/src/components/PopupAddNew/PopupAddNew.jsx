import React, {useState} from "react";
import "./PopupAddNew.scss";
import filmServices from "../../services/filmServices";

const PopupAddNew = ({ title, setTitle, oldOptions, setOptions}) => { 
    const [newOptions, setNewOptions] = useState([{name: ''}]);

    if (title == '') return null;

    const addNewInput = () => {
        setNewOptions([...newOptions, {name: ''}]);
    }

    const removeInput = (index) => {
        const newOptionsCopy = [...newOptions];
        newOptionsCopy.splice(index, 1);
        setNewOptions(newOptionsCopy);
    }

    const handleChangeInput = (index, e) => {
        const newOptionsCopy = [...newOptions];
        newOptionsCopy[index].name = e.target.value;
        setNewOptions(newOptionsCopy);
    }

    const handleClose = () => {
        setTitle('');
        setNewOptions([{name: ''}]);
    }

    const postNewOptions = (handlePost) => {
        const filtedNewOptions = Array.from(
            new Map(newOptions.filter(option => option.name !== '').map(option => [option.name, option])).values()
        );
        const failedOptions = filtedNewOptions.filter(option => oldOptions.some(oldOption => option.name === oldOption.name));
        if (failedOptions.length > 0) {
            setNewOptions([{name: ''}]);
            alert(`${failedOptions.map(option => option.name).join(', ')} already existed`);
            return;
        }
        for (let option of filtedNewOptions) {
            handlePost({name: option.name}).then((res) => {
                setOptions([res]);
            }
            ).catch((err) => {
            });
        }
    }

    const submitNewOptions = () => {
        switch (title) {
            case 'Genres':
                postNewOptions(filmServices.postGenre);
                break;
            case 'Tags':
                postNewOptions(filmServices.postTag);
                break;
            case 'Nationality':
                postNewOptions(filmServices.postNationality);
                break;
            case 'Directors':
            case 'Actors':
            case 'Screenwriters':
                postNewOptions(filmServices.postPeople);
                break;
            default:
                break;
        }
        setNewOptions([{name: ''}]);
    }


    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-header">
                    {`add new ${title}`}
                </div>
                <div className="popup-add-new-content">
                    {newOptions.map((option, index) => (
                        <div className="add-new-directors-box" key={index}>
                            <input type="text" 
                                className="add-name" 
                                placeholder="Name" 
                                value={option.name} 
                                onChange={(e) => handleChangeInput(index, e)}
                            />
                            <div className="add-subtract-button-container">
                                {newOptions.length === 1 ?
                                    <button type="button" className="add-button add-subtract-btn" onClick={addNewInput}>+</button>
                                    :
                                    <div style={{display: 'flex', gap: '5px'}}>
                                        <button type="button" className="add-button add-subtract-btn" onClick={addNewInput}>+</button>
                                        <button type="button" className="subtract-button add-subtract-btn" onClick={() => removeInput(index)}>-</button>
                                    </div>
                                }
                            </div>
                        </div>
                    ))}  
                </div>
                <div className="button-container">
                    <button type="button" className="cancel-btn" onClick={handleClose}>Cancel</button>
                    <button type="button" className="add-new-option-btn" onClick={submitNewOptions}>Confirm</button>
                </div>
            </div>
        </div>    
    )
};

export default PopupAddNew;