import { json } from "body-parser";
import { log } from "console";
import { Request, Response, NextFunction } from "express";
var id = 1
interface Contact {
    id: number,
    phoneNumber: string,
    email: string,
    linkedId?: number,
    linkPrecedence: Precedence
    createdAt: Date,
    updatedAt: Date
    deletedAt?: Date
}
interface Output{
    primaryContactId:number,
    emails:string[],
    phoneNumbers: string[]
    secondayContactId:number[],

}
enum Precedence {
    SECONDARY = "secondary",
    PRIMARY = "primary"
}
const contacts: Contact[] = []


const identifyUser = (req: Request, res: Response, next: NextFunction) => {
    const { email, phoneNumber } = req.body
    let fcontact = contacts.find(x => x.email == email && x.phoneNumber == phoneNumber)
    if (!fcontact) {
        fcontact=CheckContact(email,phoneNumber)
    }
    res.json({contact:formatOutput(findParent(fcontact))})
}
const createContact=(email:string,phoneNumber:string,linkPrecedence:Precedence)=>{
    const contact: Contact = {
        id: id++,
        phoneNumber: phoneNumber,
        email: email,
        linkPrecedence: linkPrecedence,
        createdAt: new Date(),
        updatedAt: new Date()
    }
    return contact;
}
const CheckContact = (email: string, phoneNumber: string) => {
    let checkContact = contacts.find(x => x.email == email || x.phoneNumber == phoneNumber);
    let contact:Contact
    if (checkContact) {
       let prev=findLastChild(checkContact)
       contact=createContact(email,phoneNumber,Precedence.SECONDARY);
        prev.linkedId=contact.id
    }else{
        contact=createContact(email,phoneNumber,Precedence.PRIMARY)
    }
    contacts.push(contact)
    return contact
}
const findLastChild=(contact:Contact)=>{
    let prev=contact,cur:Contact | undefined=contact
    while (prev.linkedId) {
         prev = cur!
         cur = contacts.find(x => x.id == contact?.linkedId)
    }
    return prev
}
const findParent=(contact:Contact)=>{
    let prev=contact,cur:Contact | undefined=contact
    while (prev.linkPrecedence !==Precedence.PRIMARY) {
         prev = cur!
         cur = contacts.find(x =>  x.id !==cur?.id && x.email ==cur?.email || x.phoneNumber == cur?.phoneNumber)
    }
    return prev
}
const formatOutput=(parent:Contact)=>{
    let prev=parent,cur:Contact | undefined=parent
    const op:Output={
        primaryContactId: parent.id,
        emails: [],
        phoneNumbers: [],
        secondayContactId: []
    }
    op.emails.push(cur.email)
    op.phoneNumbers.push(cur.phoneNumber)
    while (prev.linkedId) {
        prev = cur!
        cur = contacts.find(x => x.id == cur?.linkedId)
        if(cur){
           op.secondayContactId.push(cur.id)
           !op.emails.find(x=>x==cur?.email) && op.emails.push(cur.email)
           !op.phoneNumbers.find(x=>x==cur?.phoneNumber) && op.phoneNumbers.push(cur.phoneNumber)
        }
   }
   return op
}
export { identifyUser }
