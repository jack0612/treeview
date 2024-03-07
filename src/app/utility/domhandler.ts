
export class DomHandler {

    public static zindex: number = 1000;

    public static addClass(element: any, className: string): void {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }


    public static removeClass(element: any, className: string): void {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    public static hasClass(element: any, className: string): boolean {
        if (element.classList)
            return element.classList.contains(className);
        else
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
    }



    public static findSingle(element: any, selector: string): any {
        if (element) {
            return element.querySelector(selector);
        }
        return null;
    }

    public static getHeight(el:any): number {
        let height = el.offsetHeight;
        let style = getComputedStyle(el);

        height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

        return height;
    }

    public static getWidth(el:any): number {
        let width = el.offsetWidth;
        let style = getComputedStyle(el);

        width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

        return width;
    }



}
