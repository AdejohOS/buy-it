import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BillboardColumn } from "./columns"
import { Button } from "@/components/ui/button"
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { AlertModal } from "@/components/modals/alert-modal"
import { useState } from "react"
import axios from "axios"

interface CellActionProps {
    data: BillboardColumn
}
export const CellAction = ({data}: CellActionProps) => {

    const params = useParams()
    const router = useRouter()

    const [open, setOpen] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(false)

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast({
            description: 'Billboard Id copied to clipboard'
        })
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            await axios.delete(`/api/${params.storeId}/billboards/${data.id}`)
            router.refresh()
            toast({
                description: 'Billboard deleted'
            })
        } catch (error) {
            toast({
                description: 'Make sure you remove all categories using this billboard'
            })
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }
    
    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                isLoading={isLoading}

            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0" variant='ghost'>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="w-4 h-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy(data.id)}>
                        <Copy className="m-2 h-4 w-4"/>
                        Copy Id
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/billboards/${data.id}`)}>
                        <Edit className="m-2 h-4 w-4"/>
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Trash className="m-2 h-4 w-4"/>
                        Trash
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}