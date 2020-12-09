export const smoothScroll = (scrollbar: Element, pixels: number, direction: "left" | "right" | "up" | "down") => {
    let scrolled = 0;
    const step = pixels / 4;
    let scrollTimer = setInterval(() => {
        switch (direction) {
            case "left":
                scrollbar.scrollLeft -= step;
                break;
            case "right":
                scrollbar.scrollLeft += step;
                break;
            case "up":
                scrollbar.scrollTop -= step;
                break;
            case "down":
                scrollbar.scrollTop += step;
                break;
            default:
                console.log(`Invalid direction: ${direction}\ndirection can only be "left", "right", "up" or "down"!`);
        }
        scrolled += step;
        if (scrolled >= pixels) {
            clearInterval(scrollTimer);
        }
    }, 15);
}

export function downloadFromUrl(url: string, name: string) {
    console.log("downloading...");
    let link: HTMLAnchorElement = document.createElement("a");
    link.download = name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}