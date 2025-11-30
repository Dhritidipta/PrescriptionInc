package com.prescription.app.server;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PresController {

    @GetMapping("/list")
    public String PresListController(){
        return "Here is the list of Prescriptions";
    }
}
