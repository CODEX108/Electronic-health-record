pragma solidity ^0.5.1;

contract Agent {

    struct patient {
        string name;
        uint age;
        address[] doctorAccessList;
        uint[] diagnosis;
    }

    struct doctor {
        string name;
        uint age;
        address[] patientAccessList;
    }

    uint creditPool;

    address[] public patientList;
    address[] public doctorList;
    mapping (address => patient) patientInfo;
    mapping (address => doctor) doctorInfo;
    mapping (address => address) Empty;

    function add_agent(string memory _name, uint _age, uint _designation) public returns(string memory) {
        address addr = msg.sender;
        if (_designation == 0) { // Patient
            patient memory p;
            p.name = _name;
            p.age = _age;
            patientInfo[msg.sender] = p;
            patientList.push(addr);
            return _name;
        } else if (_designation == 1) { // Doctor
            doctorInfo[addr].name = _name;
            doctorInfo[addr].age = _age;
            doctorList.push(addr);
            return _name;
        } else {
           revert();
        }
    }

    function get_patient(address addr) view public returns (string memory, uint, uint[] memory, address) {
        return (patientInfo[addr].name, patientInfo[addr].age, patientInfo[addr].diagnosis, Empty[addr]);
    }

    function get_doctor(address addr) view public returns (string memory, uint) {
        return (doctorInfo[addr].name, doctorInfo[addr].age);
    }

    function get_patient_doctor_name(address paddr, address daddr) view public returns (string memory, string memory) {
        return (patientInfo[paddr].name, doctorInfo[daddr].name);
    }

    function permit_access(address addr) payable public {
        require(msg.value == 2 ether);
        creditPool += 2;

        doctorInfo[addr].patientAccessList.push(msg.sender);
        patientInfo[msg.sender].doctorAccessList.push(addr);
    }

    // Called by a doctor to process a diagnosis and claim insurance
    function insurance_claim(address paddr, uint _diagnosis) public {
        bool patientFound = false;
        for (uint i = 0; i < doctorInfo[msg.sender].patientAccessList.length; i++) {
            if (doctorInfo[msg.sender].patientAccessList[i] == paddr) {
                msg.sender.transfer(2 ether);
                creditPool -= 2;
                patientFound = true;
            }
        }

        if (patientFound) {
            remove_patient(paddr, msg.sender);
        } else {
            revert();
        }

        bool diagnosisFound = false;
        for (uint j = 0; j < patientInfo[paddr].diagnosis.length; j++) {
            if (patientInfo[paddr].diagnosis[j] == _diagnosis) {
                diagnosisFound = true;
            }
        }
        // Note: The original code didn't do anything with `diagnosisFound`.
        // Leaving it as-is unless more logic is needed.
    }

    function remove_element_in_array(address[] storage Array, address addr) internal {
        uint del_index = Array.length;
        for (uint i = 0; i < Array.length; i++) {
            if (Array[i] == addr) {
                del_index = i;
                break;
            }
        }

        if (del_index == Array.length) {
            revert("Address not found in array");
        }

        // Replace the element to delete with the last one, then pop.
        Array[del_index] = Array[Array.length - 1];
        Array.pop();
    }

    function remove_patient(address paddr, address daddr) public {
        remove_element_in_array(doctorInfo[daddr].patientAccessList, paddr);
        remove_element_in_array(patientInfo[paddr].doctorAccessList, daddr);
    }

    function get_accessed_doctorlist_for_patient(address addr) public view returns (address[] memory) {
        return patientInfo[addr].doctorAccessList;
    }

    function get_accessed_patientlist_for_doctor(address addr) public view returns (address[] memory) {
        return doctorInfo[addr].patientAccessList;
    }

    function revoke_access(address daddr) public payable {
        remove_patient(msg.sender, daddr);
        msg.sender.transfer(2 ether);
        creditPool -= 2;
    }

    function get_patient_list() public view returns(address[] memory) {
        return patientList;
    }

    function get_doctor_list() public view returns(address[] memory) {
        return doctorList;
    }

    // New function for backend to verify permissions
    function hasAccess(address _doctor, address _patient) public view returns (bool) {
        for (uint i = 0; i < patientInfo[_patient].doctorAccessList.length; i++) {
            if (patientInfo[_patient].doctorAccessList[i] == _doctor) {
                return true;
            }
        }
        return false;
    }
}