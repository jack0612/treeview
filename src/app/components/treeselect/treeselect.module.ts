import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "primeng/api";
import { RippleModule } from "primeng/ripple";
//import { TreeModule } from "primeng/tree";
import { TreeSelect } from "./treeselect";
import { TreeModule } from "../tree/tree.module";
 

@NgModule({
    imports: [CommonModule,RippleModule,SharedModule,TreeModule],
    exports: [TreeSelect,SharedModule,TreeModule],
    declarations: [TreeSelect]
})
export class TreeSelectModule { }