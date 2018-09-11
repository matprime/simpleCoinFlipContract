(function (Contract) {
    var web3_instance;
    var instance;
    var accounts;


    function init(cb) {
        web3_instance = new Web3(
            (window.web3 && window.web3.currentProvider) ||
            new Web3.providers.HttpProvider(Contract.endpoint));

        accounts = web3.eth.accounts;

        var contract_interface = web3_instance.eth.contract(Contract.abi);
        instance = contract_interface.at(Contract.address);
        cb();
    }

    function getBalance() {
        instance.getBalance(function (error, result) {
            if(error){
                alert(error);
            }
            else{
                $("#balance").html(result.toString());
            }
        });
    }

    function waitForReceipt(txHash, cb) {
        web3_instance.eth.getTransactionReceipt(txHash, function(error, receipt) {
            if(error) {
                alert(error);
            }
            else if(receipt !== null){
                cb(receipt);
            }
            else{
                window.setTimeout(function(){
                    waitForReceipt(txHash, cb);
                }, 5000);
            }
        });
    }

    function getResult() {
        instance.getLastFlip(accounts[0], function(error, result){
            if(result){
               $('#result').html('You won!!');
               $('#submit').show();
            }
            else{
                $('#result').html('You lost!!');
                $('#submit').show();
            }
        });
    }

    function flip() {
        let betVal = parseInt($("#bet").val());
        let contVal = parseInt($("#balance").html());
        if (betVal <= contVal) {
            $('#result').html('Your bet is accepted! Please wait to see if you will win ...');
            $('#submit').hide();
            instance.flip.sendTransaction({from: accounts[0], gas: 100000, value: betVal}, function(error, txHash) {
                if (error){
                    alert(error);
                }
                else{
                    waitForReceipt(txHash, function(receipt){
                        if(receipt.status === "0x1") {
                            getResult();
                            getBalance();
                        }
                        else{
                            alert("Receipt status fail");
                        }
                    });
                }
            });
        } else {
            $('#result').html('Your bet is not accepted! Contract has not enogh money, please enter lower bat.');
        }
    }

    $(document).ready(function () {
        init(function () {
            getBalance();
        });
        $("#submit").click(function(){
            flip();
        });
    });
})(Contracts['Coinflip']);
