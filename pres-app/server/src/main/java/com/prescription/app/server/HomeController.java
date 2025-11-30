package com.prescription.app.server;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;

@Controller
class HomeController {

    @GetMapping("/")
    public String home() {
        return "redirect:https://prescription-inc.vercel.app/";
    }
}
