import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [],
  templateUrl: './signature.html',
  styleUrl: './signature.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Signature),
      multi: true,
    },
  ],
})
export class Signature implements OnInit, ControlValueAccessor, OnDestroy {
  @ViewChild('signatureCanvas') signatureCanvas?: ElementRef<HTMLCanvasElement>;

  private resizeObserver?: ResizeObserver;

  // private signatureDataUrl: string;
  private _signature: any = null;
  private signaturePad?: SignaturePad;
  private pendingValue?: string | null;

  // private readonly onResize = this.resizeCanvas.bind(this);

  get signature(): any {
    return this._signature;
  }

  set signature(value: any) {
    this._signature = value;
    console.log('set signature to ' + value);
    console.log('signature data :');
    console.log(this.signaturePad!.toData());
    this._onChange(this._signature);
  }

  private _onChange: (value: string) => void = () => {
    // this.signatureDataUrl = value;
  };
  private _onTouched: () => void = () => {};

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  public ngOnInit(): void {}

  public ngAfterViewInit(): void {
    if (!this.signatureCanvas) {
      console.error('signatureCanvas is null');
      return;
    }

    this.signaturePad = new SignaturePad(this.signatureCanvas.nativeElement);
    // this.signaturePad.clear();
    if (this.pendingValue) {
      this.signature = this.pendingValue;
      this.signaturePad.fromDataURL(this.pendingValue);
      this.pendingValue = null;
    }
    this.bindEventListeners();
    this.resizeCanvas();
  }

  private bindEventListeners(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });

    this.resizeObserver.observe(this.signatureCanvas!.nativeElement);

    // window.addEventListener('resize', this.onResize);
    this.signatureCanvas!.nativeElement.addEventListener('pointerup', this.drawComplete.bind(this));
    this.signatureCanvas!.nativeElement.addEventListener('pointerdown', this.drawBegin.bind(this));
  }

  public resizeCanvas(): void {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    const ratio: number = Math.max(window.devicePixelRatio || 1, 1);

    const canvas: HTMLCanvasElement | undefined = this.signatureCanvas?.nativeElement;
    if (!canvas || !this.signaturePad) return;
    //   console.error('canvas is null');
    //   return;
    // }

    // Taille CSS réelle (indépendante des anciens resizes)
    const rect = canvas.getBoundingClientRect();

    // Sauvegarde du dessin
    const data = this.signaturePad.isEmpty() ? null : this.signaturePad.toData();

    // const width = Math.floor(canvas.clientWidth * ratio);
    // const height = Math.floor(canvas.clientHeight * ratio);
    const width = Math.round(rect.width * ratio);
    const height = Math.round(rect.height * ratio);

    // const width = canvas.offsetWidth * ratio;
    // const height = canvas.offsetHeight * ratio;
    if (canvas.width === width && canvas.height === height) {
      return; // stop boucle
    }

    // canvas.width = width;
    // canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    // ctx!.scale(ratio, ratio);

    // this.signaturePad!.clear(); // otherwise isEmpty() might return incorrect value
    // this.signaturePad?.fromDataURL(this.signature);

    // Restauration
    if (data) {
      this.signaturePad.fromData(data);
    } else {
      if (this.signature) {
        this.signaturePad.fromDataURL(this.signature);
      }
    }

    console.log('resize done');
  }

  public drawBegin(): void {
    console.log('Begin Drawing');
    if (!this.signaturePad) return;
  }

  public drawComplete(): void {
    if (!this.signaturePad) return;
    this.signature = this.signaturePad.toDataURL('image/svg+xml');
  }

  writeValue(value: string): void {
    if (!value) {
      return;
    }

    this.pendingValue = value;
    // this.signature = value;
    // this.signaturePad!.fromDataURL(this.signature);
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public clear(): void {
    this.signaturePad!.clear();
    this.signature = '';
  }

  // @HostListener('window:resize')
  // onWindowResize(): void {
  //   this.resizeCanvas();
  // }
}
