export interface cargas
{
    id:number,
    cargas:creditos[],
    creditosTotales:number
}

export interface creditos
{
    codigo:string,
    valor:number
    fecha:any
}