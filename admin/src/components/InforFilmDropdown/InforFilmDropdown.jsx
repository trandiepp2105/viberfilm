import React, {useState, useEffect, useRef} from "react";
import "./InforFilmDropdown.scss";

const InforFilmDropdown = ({ title, options, handleTitlePopup, selected, handleSelected}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState(null);
    const dropdownRef = useRef(null);
    const [selectedLetter, setSelectedLetter] = useState('');
    const frameRef = useRef(null);
    const optionsRef = useRef(null);
    const [sortedOptions, setSortedOptions] = useState([]);
    const scrollTimeout = useRef(null);

    const removeDiacritics = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;

        const optionHeight = frame.querySelector(".option")?.offsetHeight || 0;

        const handleScroll = () => {
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

            scrollTimeout.current = setTimeout(() => {
                const index = Math.round(frame.scrollTop / optionHeight);
                frame.scrollTo({
                    top: index * optionHeight,
                    behavior: "smooth",
                });
            }, 100);
        };
        frame.addEventListener("scroll", handleScroll);
        return () => {
            frame.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [sortedOptions]);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        const updateFirstVisibleLetter = () => {
            const listOption = Array.from(frame.querySelectorAll(".option"));
            let firstVisible = null;
    
            for (const option of listOption) {
                const rect = option.getBoundingClientRect();
                const frameRect = frame.getBoundingClientRect();
    
                if (rect.top >= frameRect.top && rect.bottom <= frameRect.bottom) {
                    firstVisible = option;
                    break;
                }
            }
    
            if (firstVisible) {
                setSelectedLetter(firstVisible.dataset.letter);
            }
        };
    
        frame.addEventListener("scroll", updateFirstVisibleLetter);
        updateFirstVisibleLetter();

        return () => frame.removeEventListener("scroll", updateFirstVisibleLetter);
    }, [sortedOptions]);

    useEffect(() => {
        if (isOpen && dropdownPosition) {
            if (window.innerHeight - dropdownPosition.bottom - 50 < 240) {
                optionsRef.current.style.top = "auto";
                optionsRef.current.style.bottom = "100%";
            }
            else {
                optionsRef.current.style.top = "100%";
                optionsRef.current.style.bottom = "auto";
            }
        }
    }, [isOpen, dropdownPosition]);

    const handleGetPosition = () => {
        const rect = dropdownRef.current.getBoundingClientRect();
        setDropdownPosition({
            top: rect.top,
            height: rect.height,
            bottom: rect.bottom,
        });
    }

    useEffect(() => {
        if (isOpen) {
            handleGetPosition();
        }
    }, [isOpen]);

    const handleSelectOption = (option) => {
        handleSelected(prev => [...prev, option]);
    }

    const removeSelectedOption = (option) => {
        handleSelected(prev => prev.filter(item => item !== option));
    }

    useEffect(() => {
        if (isOpen) {
            const sortedList = [...options]
                .filter(option => option?.name)
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter(option => !selected.includes(option));
            setSortedOptions(sortedList);
        }
    }, [selected, options, isOpen]);

    const handleChangeSearch = (e) => {
        const searchValue = removeDiacritics(e.target.value.toLowerCase());
        const newOptions = options.filter(option => removeDiacritics(option.name.toLowerCase()).includes(searchValue));
        setSortedOptions([...newOptions].sort((a, b) => a.name.localeCompare(b.name)));
    }

    return (
        <div className="dropdown-container">
            <p className="dropdown-title">{title}</p>
            <div className="dropdown-selection" 
                onClick={() => {
                    setIsOpen(!isOpen);
                    handleGetPosition();
                }}  
                ref={dropdownRef}>
                <div className="dropdown-box" style={{borderBottom: isOpen ? '2px solid #087D95' : '1px solid black'}}>
                    <div className="option-show">
                        {selected.map((option, index) => (
                            <div key={index} className="selected-option-show" onClick={(e) => e.stopPropagation()}>
                                <p className="selected-option-name">{option.name}</p>
                                <img src="/assets/icons/close.png" 
                                    alt="remove" 
                                    className="remove-icon" 
                                    onClick={() => removeSelectedOption(option)}
                                    style={{width: "10px", aspectRatio: "1"}}/>
                            </div>
                        ))}
                    </div>
                    <img src="/assets/icons/down-arrow-black.png" 
                        alt="" 
                        className="dropdown-img" 
                        style={{transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}/>
                </div>
                {isOpen &&
                    <div className="options" onClick={(e) => e.stopPropagation()}
                        ref={optionsRef}>
                        <div className="search-and-add-new">
                            <div className="search-box">
                                <input type="text" className="dropdown-search" placeholder="Search" onChange={handleChangeSearch}/>
                                <img src="/assets/icons/search-interface-symbol.png" alt="search" className="search-icon"/>
                            </div>
                            <button type="button" className="add-new-button" onClick={() => {handleTitlePopup(title); setIsOpen(false)}}>
                                <p className="add-new">New</p>
                                <img src="/assets/icons/plus 1.png" alt="add-new" className="add-new-icon"/>
                            </button>
                        </div>
                        <div className="first-letter">
                            <p className="letter">{selectedLetter}</p>
                        </div>
                        <div className="options-frame" ref={frameRef}>
                            {sortedOptions.map((option, index) => (
                                <div key={index} 
                                    className="option" 
                                    data-letter={removeDiacritics(option.name)[0]}
                                    onClick={() => handleSelectOption(option)}
                                >{option.name}</div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default InforFilmDropdown;