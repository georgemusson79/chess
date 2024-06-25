export function action(URL, data) {
    let form=document.createElement("form");
    form.method="POST";
    form.style.display="none";
    form.action=URL;
    document.body.appendChild(form);

    for (let [k,v] of Object.entries(data)) {
        let input=document.createElement("input");
        input.type="text";
        input.name=k;
        input.value=v;
        form.appendChild(input);
    }

    form.submit();
    form.remove();

}

export function getUppermostParent(node) {
    while (node.parentNode && node.parentNode.nodeName!="BODY") {
        node=node.parentNode;
    }

    return node;
}