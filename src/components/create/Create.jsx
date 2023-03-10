import React from "react";

import { create as IPFSHTTPClient } from "ipfs-http-client";
import { useState } from "react";
import "./create.css";
import { Buffer } from "safe-buffer";
import { ethers } from "ethers";

import NFTABI from "../../contractData/DeloreanOriginals.json";

// const client = IPFSHTTPClient('https://ipfs.io:5001/api/v0')
const client = IPFSHTTPClient({
  host: "infura-ipfs.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization:
      "Basic " +
      Buffer.from(
        "2HaaNvC3Rz6UXedPAXzOWwrUnDg:6aecc032a87f658c1be0aae5b0950067"
      ).toString("base64"),
  },
});

const Create = (props) => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [royaltyPrc, setRoyaltyPrc] = useState("");
  const [isMinted, setIsMinted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const mrktContract = props.marketplace;

  const uploadtoIPFS = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await client.add(file);
        console.log(result);
        console.log(
          `https://deloreanmarkets.infura-ipfs.io/ipfs/${result.path}`
        );
        setImage(`https://deloreanmarkets.infura-ipfs.io/ipfs/${result.path}`);
      } catch (err) {
        console.log("IPFS image upload error", err);
      }
    }
  };
  const mint = async (result) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let m = await provider.send("eth_requestAccounts", []);
    let nftContract = new ethers.Contract(
      "0x8eceF937192A45cddf5f739263eD7f8940b257D1",
      NFTABI.abi,
      signer
    );

    console.log(`https://deloreanmarkets.infura-ipfs.io/ipfs/${result.path}`);
    const uri = `https://deloreanmarkets.infura-ipfs.io/ipfs/${result.path}`;
    try {
      const tx = await nftContract.mint(uri, royaltyPrc);
      setIsConfirming(true);
      const receipt = await tx.wait();
      if (receipt) {
        setIsConfirming(false);
        setIsMinted(true);
      }
    } catch (err) {
      console.log("error minting uri", err);
    }
  };
  const createNFT = async () => {
    if (!image || !name) {
      return;
    }
    try {
      const data = JSON.stringify({ image, name, description });
      const result = await client.add(data);
      console.log("Metadata added to IPFS");
      mint(result);
    } catch (err) {
      console.log("Error creating Metadata", err);
    }
  };

  return (
    <div>
      <div className="sec-title mg2">LINK YOUR ITEM</div>
  
      <div className="create-nft-wrap">

           <div class="file-upload | ">
              <input
                className="create-input-file"
                type="file"
                name="file"
                onChange={uploadtoIPFS}
              />
            </div>

        {!isConfirming && !isMinted ? (
          <div className="create-inner-wrap">
            
            <div>
              <input
                className="create-input"
                type="text"
                onChange={(e) => setName(e.target.value)}
                placeholder="Item Name"
              />
            </div>
            <div>
              <textarea
                className="create-input-description"
                type="text"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
            </div>
            <div>
              <input
                className="create-input-number"
                type="number"
                onChange={(e) => setRoyaltyPrc(e.target.value)}
                max={50}
                placeholder="Royalty %"
              />
            </div>
            <div>
              <button className="create-input-btn" onClick={createNFT}>
                Create Item
              </button>
            </div>
          </div>
        ) : isConfirming && !isMinted ? (
          <div className="create-inner-wrap">
            <div>Confirming Transaction...</div>
          </div>
        ) : !isConfirming && isMinted ? (
          <div className="create-inner-wrap">
            <div>NFT Minted!</div>
          </div>
        ) : (
          <div className="create-inner-wrap">
            <div>ERROR</div>
          </div>
        )}
      </div>
    </div>
  );
};

//drag and drop



//-------

export default Create;

