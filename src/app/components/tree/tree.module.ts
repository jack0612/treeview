import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

 
import { ScrollerModule } from "primeng/scroller";
import { Tree } from "./tree";
import { UITreeNode } from "./tree-node.component";
import { SharedModule } from "../api/shared";
import { RippleModule } from "../api/ripple";
 

@NgModule({
    imports: [CommonModule,SharedModule,RippleModule,ScrollerModule],
    exports: [Tree,SharedModule,ScrollerModule],
    declarations: [Tree,UITreeNode]
})
export class TreeModule { }