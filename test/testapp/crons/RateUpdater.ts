

const RateUpdater = {
    schedule:'*/15 * * * *',
    enabled:true,
    immediate:true,
    task:() => {
        console.log(new Date().toDateString())
        
    }
}

export = RateUpdater;