import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/userModel';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public user?: UserModel;
  public role: any;

  constructor(private userService: UserService) { 
        this.user = userService.user;
        this.role = userService.user?.role;
  }

  ngOnInit(): void {
  }

}
