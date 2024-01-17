try {
  let res = await window.unisat.signPsbt(
    "02000000000101ed4765c5e0b714f2704b7cf370cd98fa7028f22000c32c1772ddedccd29d7fe80100000000ffffffff02e803000000000000160014a8f8acfd3b26fcc5babfbc4df12e98fe48aa4aac53480400000000001976a914409396ba3a6e94dc7d7c46b13e2d6a351bdc5d4788ac0247304402207f50de54318b4dd133e558b74318d106a79489c8e3f23a6c6ff389ab1bfd5da802205138048efbe64db62e558f63bf705850b488a175b686424f9f298ea2d0495ec30121027ad4e1e5541d14fc78dc92f1f318be63765f173c3a0d33395651124459a5621200000000",
    {
      autoFinalized: false,
      toSignInputs: [
        {
          index: 0,
          address: "tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6",
        },
        {
          index: 1,
          publicKey: "tb1qgzfedw36d62dcltug6cnutt2x5dach2833vtt6",
          sighashTypes: [1],
        },
        {
          index: 2,
          publicKey:
            "026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01",
        },
      ],
    }
  );
  console.log(res);
} catch (e) {
  console.log(e);
}

unisat.signPsbt(
  "02000000000101ed4765c5e0b714f2704b7cf370cd98fa7028f22000c32c1772ddedccd29d7fe80100000000ffffffff02e803000000000000160014a8f8acfd3b26fcc5babfbc4df12e98fe48aa4aac53480400000000001976a914409396ba3a6e94dc7d7c46b13e2d6a351bdc5d4788ac0247304402207f50de54318b4dd133e558b74318d106a79489c8e3f23a6c6ff389ab1bfd5da802205138048efbe64db62e558f63bf705850b488a175b686424f9f298ea2d0495ec30121027ad4e1e5541d14fc78dc92f1f318be63765f173c3a0d33395651124459a5621200000000",
  {
    toSignInputs: [
      {
        index: 0,
        publicKey:
          "027ad4e1e5541d14fc78dc92f1f318be63765f173c3a0d33395651124459a56212",
        disableTweakSigner: true,
      },
    ],
    autoFinalized: false,
  }
);
