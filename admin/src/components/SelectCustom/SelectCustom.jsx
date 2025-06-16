import React, {useState, useRef, useEffect, use} from 'react';
import styles from './SelectCustom.module.scss';

const SelectCustom = ({label, onChange, options}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(options[0]);
    const selectRef = useRef(null);
    const optionsRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState(null);

    useEffect(() => {
        onChange(selected);
    });
        

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handlePosition = () => {
        const rect = selectRef.current.getBoundingClientRect();
        setDropdownPosition({
            top: rect.top,
            height: rect.height,
            bottom: rect.bottom
        });
    }

    useEffect(() => {
        if (isOpen && dropdownPosition) {
            if (window.innerHeight - dropdownPosition.bottom -50 < 240) {
                optionsRef.current.style.top = "auto";
                optionsRef.current.style.bottom = "100%";
            }
            else {
                optionsRef.current.style.top = "100%";
                optionsRef.current.style.bottom = "auto";
            }
        }
    });

    useEffect(() => {
        handlePosition();
    }
    , [isOpen]);

    return (
        <div className={styles["select-custom"]}>
            <p className={styles.label}>{label}</p>
            <div className={styles["options-container"]} ref={selectRef}>
                <div className={styles["selected"]} 
                    onClick={() => {
                        setIsOpen(!isOpen)
                        handlePosition();
                    }} 
                    style={{borderBottom: isOpen ? '2px solid #087D95' : '1px solid black'}}
                > 
                    {selected}
                </div>
                {isOpen && 
                    <div className={styles["option-list"]} ref={optionsRef}>
                        {options.map(option => (
                            <div key={option} className={styles["option"]} onClick={() => {
                                setSelected(option);
                                onChange(option);
                                setIsOpen(false);}}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export default SelectCustom;