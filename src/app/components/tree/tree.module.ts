import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

 

import { Tree } from "./tree";
import { UITreeNode } from "./tree-node.component";
import { SharedModule } from "../api/shared";
import { RippleModule } from "../api/ripple";
import { ScrollerModule } from "../scroller/scroller";
 
 

@NgModule({
    imports: [CommonModule,SharedModule,RippleModule,ScrollerModule],
    exports: [Tree,SharedModule,ScrollerModule],
    declarations: [Tree,UITreeNode]
})
export class TreeModule { }