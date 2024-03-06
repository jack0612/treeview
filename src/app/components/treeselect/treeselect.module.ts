import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TreeSelect } from "./treeselect";
import { TreeModule } from "../tree/tree.module";
import { SharedModule } from "../api/shared";
import { RippleModule } from "../api/ripple";
 

@NgModule({
    imports: [CommonModule,RippleModule,SharedModule,TreeModule],
    exports: [TreeSelect,SharedModule,TreeModule],
    declarations: [TreeSelect]
})
export class TreeSelectModule { }