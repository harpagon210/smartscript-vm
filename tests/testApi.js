function testAction() {
    print(Api.sender);
}

function testAction2() {
    print(Api.params.nb);
}


if (Api.action == 'testAction') {
    testAction();
} 

if (Api.action == 'testAction2') {
    testAction2();
} 
