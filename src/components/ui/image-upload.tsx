'use client'

import { ImagePlus, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import Image from 'next/image'
import { CldUploadWidget } from 'next-cloudinary'

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (valus: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload = ({ disabled, onChange, onRemove, value}: ImageUploadProps) => {

    const [isMounted, setIsMounted] = useState<boolean>(false)

    useEffect(() => {
        setIsMounted(true)
    }, []);


    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    }


    if (!isMounted) {
        return null;
    }

    
    
  return (
    <div>
        <div className="mb-4 flex items-center gap-4">
            {value.map((url) => (
                <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                    <div className="z-10 absolute top-2 right-2">
                        <Button type='button' onClick={() => onRemove(url)} variant='destructive' size='sm'>
                            <Trash className=" w-4 h-4"/>
                        </Button>

                    </div>
                    <Image
                        fill
                        src={url}
                        alt="image"
                        className="object-cover"
                    />
                </div>
            ))}
        </div>
        <CldUploadWidget onUpload={onUpload} uploadPreset="f4vy4p4d">
            {({ open }) => {
                const onClick = () => {
                    open();
                }
                return (
                    <Button
                        type="button"
                        disabled={disabled}
                        variant='subtle'
                        onClick={onClick}

                    >
                        <ImagePlus className="w-4 h-4 mr-2"/>
                        Upload an image
                    </Button>
                )
            }}
        </CldUploadWidget>
    </div>
  )
}

export default ImageUpload