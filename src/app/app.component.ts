import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Web3, { Transaction } from 'web3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private web3: Web3;
  public account: string | null = null;
  public transactionData: string | null = null;
  public transactionForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.web3 = new Web3((window as any).ethereum);
    this.transactionForm = this.fb.group({
      to: [''],
      amount: ['']
    });
  }

  async ngOnInit() {
    await this.loadWeb3();
    await this.loadAccount();
  }

  private async loadWeb3() {
    if ((window as any).ethereum) {
      await (window as any).ethereum.enable();
    } else {
      alert('Please install MetaMask!');
    }
  }

  private async loadAccount() {
    const accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];
  }

  public async createTransaction() {
    const formValues = this.transactionForm.value;
    const toAddress = formValues.to;
    const amount = formValues.amount;

    const transactionRequest = {
      recipientAddress: this.account,
      amount: amount
    };

    this.http.post<any>('https://localhost:7061/api/nethereum/deposit', transactionRequest)
      .subscribe(async response => {
        console.log(response)

        const tx: Transaction = {
          from: this.account?.toString(),
          to: toAddress,
          gas: 1000000,
          gasPrice: '1000000000',
          data: response,
        };

        const signedTx = await (window as any).ethereum.request({
          method: 'eth_signTransaction',
          params: [tx]
        });
        // const signedTx = await this.web3.eth.accounts.signTransaction(tx, (window as any).ethereum.selectedAddress);

        console.log(signedTx);
      }, error => {
        console.error('Error creating transaction:', error);
      });
  }
}
