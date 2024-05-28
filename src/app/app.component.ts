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
      gas: [''],
      gasPrice: [''],
      data: ['']
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

    const tx: Transaction = {
      from: this.account?.toString(),
      to: formValues.to,
      gas: formValues.gas,
      gasPrice: formValues.gasPrice,
      data: formValues.data
    };

    const signedTx = await (window as any).ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    });

    alert(signedTx);
  }

  async signMessage() {
    console.log(1);
    if (!this.account) {
      console.log('No account detected');
      return;
    }

    this.http.get<any>(`https://localhost:7061/api/auth/nonce?walletAddress=${this.account}`).subscribe(async (data) => {
      console.log(data)
      var signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [data, this.account]
      });

      const formData = new FormData();  
      formData.append('signature', signature);

      this.http.post<any>(`https://localhost:7061/api/auth/login?walletAddress=${this.account}`, formData).subscribe((data) => {
        alert(data.accessToken)
      })
    });
  }
}
